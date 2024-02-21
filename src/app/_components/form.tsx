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
import { startRegistration } from "@simplewebauthn/browser";


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
    const resp: Response = await fetch(`https://api.seseorang.com/api/registration/start?name=${data.username}`, {
        headers: {
            "Content-Type" : "application/json",
        },
    });
    let attResp;
    try {
      const {challenge} = await resp.json()
      console.log(challenge)
      attResp = await startRegistration(await resp.json());
      console.log("Registration Response", JSON.stringify({
        data : attResp,
        challenge : challenge
      }));
    } catch (error) {
      if (error instanceof Error) {
        if(error.name == "InvalidStateError"){
            console.log(
              "Error: Authenticator was probably already registered by user",
            );
        }else{
            console.log("error nih cui")
        }
      } 
      throw error;
    }
    
    // const verificationResp = await fetch('https://localhost/register/finish', {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     data : attResp,
    //     challenge : challenge
    //   }),
    // });
    // const verificationJSON = await verificationResp.json();
    // console.log("Server Response", JSON.stringify(verificationJSON, null, 2));

    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // if (verificationJSON?.verified) {
    //   toast({
    //     title: "You submitted the following values:",
    //     description: (
    //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //         <code className="text-white">Authenticator registered!</code>
    //       </pre>
    //     ),
    //   });
    //   console.log(`Authenticator registered!`);
    // } else {
    //   toast({
    //     title: "You submitted the following values:",
    //     description: (
    //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //         <code className="text-white">
    //           ${JSON.stringify(verificationJSON)}
    //         </code>
    //       </pre>
    //     ),
    //   });
    // }
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
