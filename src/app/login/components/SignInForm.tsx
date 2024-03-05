"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import {useTransition} from "react";

import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Card, CardContent, CardTitle} from "@/components/ui/card";

import {signInWithEmailAndPassword} from "../actions";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Contraseña requerida.",
  }),
});

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const result = await signInWithEmailAndPassword(data);

      const {error} = JSON.parse(result);

      if (error?.message) {
        toast({
          variant: "destructive",
          title: "You submitted the following values:",
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{error.message}</code>
            </pre>
          ),
        });
      } else {
        toast({
          title: "Inicio de sesión exitoso!",
        });
      }
    });
  }

  return (
    <Card className="mx-auto max-w-96">
      <CardTitle className="p-3 text-center">Iniciar Sesión</CardTitle>
      <CardContent>
        <Form {...form}>
          <form className=" space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@gmail.com"
                      {...field}
                      type="email"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="password"
                      {...field}
                      type="password"
                      onChange={field.onChange}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="flex w-full gap-2" type="submit">
              Enviar
              <AiOutlineLoading3Quarters className={cn("animate-spin", {hidden: !isPending})} />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
