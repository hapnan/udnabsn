/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

"use client";

import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { WebAuthnError, startRegistration } from "@simplewebauthn/browser";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});


export default function FormReg() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });
  
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const resp: Response = await fetch(
      `https://api.seseorang.com/api/registration/start?name=${data.username}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const result = await resp.json();
    
    let attResp: RegistrationResponseJSON;
    try {
      attResp = await startRegistration(result);
      console.log("Registration Response :", JSON.stringify(attResp));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == "InvalidStateError") {
          console.log(
            "Error: Authenticator was probably already registered by user",
          );
        } else {
          console.log("error nih cui");
        }
      }
      throw error;
    }

    

    const verificationResp = await fetch(
      `https://api.seseorang.com/api/registration/finish?name=${data.username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attResp),
      },
    );
    let verificationJSON;
    try {
      verificationJSON = await verificationResp.json();
      console.log("Server Response", JSON.stringify(verificationJSON, null, 2));
    } catch (error) {
      if (error instanceof WebAuthnError) {
        if (error) {
          
          console.log("Error: " + error.message);
          throw error.message;
        }
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (verificationJSON?.verified) {
      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">Authenticator registered!</code>
          </pre>
        ),
      });
      console.log(`Authenticator registered!`);
    } else {
      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              ${JSON.stringify(verificationJSON)}
            </code>
          </pre>
        ),
      });
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
