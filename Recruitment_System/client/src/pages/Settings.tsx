import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Candidate, User } from "@/types";
import { X } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get candidate data if the user is a candidate
  const { data: candidateData } = useQuery<Candidate>({
    queryKey: ["/api/candidates", user?.id],
    queryFn: async () => {
      if (user?.role !== "candidate") return null;
      const res = await apiRequest("GET", `/api/candidates/user/${user?.id}`);
      return res.json();
    },
    enabled: !!user && user.role === "candidate",
  });

  // Profile settings form
  const profileFormSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    position: z.string().optional(),
    phone: z.string().optional(),
    education: z.string().optional(),
    experience: z.string().optional(),
    bio: z.string().optional(),
  });
  
  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      position: user?.position || "",
      phone: "",
      education: "",
      experience: "",
      bio: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      profileForm.setValue("fullName", user.fullName);
      profileForm.setValue("email", user.email);
      profileForm.setValue("position", user.position || "");
    }
    
    if (candidateData) {
      profileForm.setValue("phone", candidateData.phone || "");
      profileForm.setValue("education", candidateData.education || "");
      profileForm.setValue("experience", candidateData.experience || "");
      setSkills(candidateData.skills || []);
    }
  }, [user, candidateData, profileForm]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      setIsSubmitting(true);
      
      // Update user information
      const userUpdateRes = await apiRequest("PATCH", `/api/users/${user?.id}`, {
        fullName: data.fullName,
        email: data.email,
        position: data.position,
      });
      
      // If candidate, update candidate information
      if (user?.role === "candidate" && candidateData) {
        const candidateUpdateRes = await apiRequest("PATCH", `/api/candidates/${candidateData.id}`, {
          phone: data.phone,
          education: data.education,
          experience: data.experience,
          skills: skills,
        });
      }
      
      setIsSubmitting(false);
      return userUpdateRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      if (user?.role === "candidate") {
        queryClient.invalidateQueries({ queryKey: ["/api/candidates", user?.id] });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    },
  });

  function onProfileSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values);
  }

  // Add a skill to the list
  const handleAddSkill = () => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkill("");
    }
  };

  // Remove a skill from the list
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Account settings form
  const accountFormSchema = z.object({
    currentPassword: z.string().min(1, { message: "Please enter your current password." }),
    newPassword: z.string()
      .min(8, { message: "Password must be at least 8 characters." })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    emailNotifications: z.boolean().default(true),
  }).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  type AccountFormValues = z.infer<typeof accountFormSchema>;

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      emailNotifications: true,
    },
  });

  // Mutation for updating account settings
  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      setIsSubmitting(true);
      
      const payload: any = {
        emailNotifications: data.emailNotifications,
      };
      
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }
      
      const res = await apiRequest("PATCH", `/api/users/${user?.id}/account`, payload);
      setIsSubmitting(false);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account updated",
        description: "Your account settings have been updated successfully.",
      });
      accountForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        emailNotifications: accountForm.getValues().emailNotifications,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your account settings.",
        variant: "destructive",
      });
    },
  });

  function onAccountSubmit(values: AccountFormValues) {
    updateAccountMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-neutral-dark mt-1">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {user?.role === "candidate" && (
            <TabsTrigger value="skills">Skills</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Software Engineer" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your current or desired job position.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a bit about yourself" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of yourself for your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {user?.role === "candidate" && (
                    <>
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your educational background" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your work experience" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <FormField
                      control={accountForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank if you don't want to change your password.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    
                    <FormField
                      control={accountForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications about application statuses and updates.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {user?.role === "candidate" && (
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add your skills to help recruiters find you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g. JavaScript, Project Management)"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button onClick={handleAddSkill}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 py-2">
                        {skill}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    
                    {skills.length === 0 && (
                      <p className="text-neutral-dark">No skills added yet.</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={async () => {
                        // Update the candidate with just the skills
                        setIsSubmitting(true);
                        try {
                          if (user?.role === "candidate" && candidateData) {
                            const res = await apiRequest("PATCH", `/api/candidates/${candidateData.id}`, {
                              skills: skills,
                            });
                            
                            if (res.ok) {
                              queryClient.invalidateQueries({ queryKey: ["/api/candidates", user?.id] });
                              toast({
                                title: "Skills updated",
                                description: "Your skills have been updated successfully.",
                              });
                            }
                          }
                        } catch (error) {
                          toast({
                            title: "Update failed",
                            description: "There was an error updating your skills.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Skills"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}