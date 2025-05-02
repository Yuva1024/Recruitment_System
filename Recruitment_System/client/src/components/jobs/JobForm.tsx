import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertJobSchema } from "@shared/schema";

interface JobFormProps {
  job?: {
    id: number;
    title: string;
    description: string;
    location: string;
    salary?: string;
    requirements?: string;
    status: string;
  };
  onSuccess?: () => void;
}

export function JobForm({ job, onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Extend the schema with validation rules
  const formSchema = z.object({
    title: z.string().min(5, { message: "Job title must be at least 5 characters" }),
    description: z.string().min(20, { message: "Description must be at least 20 characters" }),
    location: z.string().min(2, { message: "Location is required" }),
    salary: z.string().optional(),
    requirements: z.string().optional(),
    status: z.enum(["open", "closed", "paused"]),
    userId: z.number().default(1), // Default to first user
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      location: job?.location || "",
      salary: job?.salary || "",
      requirements: job?.requirements || "",
      status: (job?.status as "open" | "closed" | "paused") || "open",
      userId: 1, // Hardcoded for now
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (job) {
        return apiRequest("PATCH", `/api/jobs/${job.id}`, data);
      } else {
        return apiRequest("POST", "/api/jobs", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      if (onSuccess) onSuccess();
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the job responsibilities and requirements" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. San Francisco, CA (Remote)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $100,000 - $130,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List specific skills, education, or experience required" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {job ? "Updating..." : "Creating..."}
              </>
            ) : (
              job ? "Update Job" : "Create Job"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
