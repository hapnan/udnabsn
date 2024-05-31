"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { WebAuthnError, startRegistration } from "@simplewebauthn/browser";
import type {
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/types";

interface user {
  id: number;
  nim: string;
  name: string;
  createdAt: Date;
}

type verif = {
  verified: boolean;
};

const FormSchema = z.object({
  nim: z
    .string({
      required_error: "Please select an email to display.",
    })
    .min(2),
});

export default function FormRegister({ data }: { data: user[] }) {
  const user = data as unknown as user[];
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function register(data: z.infer<typeof FormSchema>) {
    const resp = await fetch(
      `https://www.seseorang.com/api/registration?nim=${data.nim}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const respon =
      (await resp.json()) as PublicKeyCredentialCreationOptionsJSON;
    let attResp: RegistrationResponseJSON;
    try {
      attResp = await startRegistration(respon);
      console.log("Registration Response :", JSON.stringify(attResp));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == "InvalidStateError") {
          console.log(
            "Error: Authenticator was probably already registered by user",
          );
        } else {
          console.log(error);
        }
      }
      throw error;
    }

    const verificationResp = await fetch(
      `https://www.seseorang.com/api/registration?nim=${data.nim}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attResp),
      },
    );
    let verificationJSON: verif | null = null;

    try {
      verificationJSON = (await verificationResp.json()) as verif;
      console.log("Server Response", JSON.stringify(verificationJSON, null, 2));
    } catch (error) {
      if (error instanceof WebAuthnError) {
        if (error) {
          console.log("Error: " + error.message);
          throw error.message;
        }
      }
    }

    if (verificationJSON && verificationJSON.verified) {
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
      <form onSubmit={form.handleSubmit(register)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="nim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={user[0]?.name} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {user.map((usr) => (
                    <SelectItem key={usr.id} value={usr.nim}>
                      {usr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
