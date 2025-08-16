"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {format, formatDate} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import {es} from "date-fns/locale";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Calendar} from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useToast} from "@/components/ui/use-toast";
import {useAddPayment} from "@/hooks/usePayments";
import {Badge} from "@/components/ui/badge";

const formSchema = z
  .object({
    vencimiento: z.coerce.date(),
    socio: z.string().min(1, "El socio es requerido"),
    conceptos: z.string().min(1, "El concepto es requerido"),
    valorARS: z.coerce.number().min(0).optional(),
    valorUSD: z.coerce.number().min(0).optional(),
  })
  .refine((data) => (data.valorARS ?? 0) > 0 || (data.valorUSD ?? 0) > 0, {
    message: "Debe completar al menos un valor (ARS o USD)",
    path: ["valorARS"],
  });

export default function AddPaymentsForm() {
  const {toast} = useToast();
  const mutation = useAddPayment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vencimiento: new Date(),
      socio: "",
      conceptos: "",
      valorARS: 0,
      valorUSD: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newPayment = {
        socio: values.socio,
        conceptos: values.conceptos,
        vencimientos: formatDate(new Date(values.vencimiento), "dd-MM"),
        ...(values.valorARS && values.valorARS > 0 && {valor: values.valorARS}),
        ...(values.valorUSD && values.valorUSD > 0 && {"valor USD": values.valorUSD}),
      };

      await mutation.mutateAsync(newPayment);

      toast({title: "Pago creado con éxito ✅"});
      form.reset();
    } catch (error: any) {
      console.error("Form submission error", error);
      toast({
        variant: "destructive",
        title: "Error al crear el pago ❌",
      });
    }
  }

  return (
    <Form {...form}>
      <form className="mx-auto max-w-3xl space-y-8 py-10" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="vencimiento"
          render={({field}) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de vencimiento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div>
                      <Button
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        type="button"
                        variant="outline"
                      >
                        {field.value ? (
                          format(field.value, "PPP", {locale: es})
                        ) : (
                          <span>Elije una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    required
                    captionLayout="dropdown"
                    locale={es}
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Fecha de vencimiento</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socio"
          render={({field}) => (
            <FormItem>
              <FormLabel>Socio</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Socio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="don">
                    <Badge className="don">DON</Badge>
                  </SelectItem>
                  <SelectItem value="apa">
                    <Badge className="apa">APA</Badge>
                  </SelectItem>
                  <SelectItem value="dgs">
                    <Badge className="dgs">DGS</Badge>
                  </SelectItem>
                  <SelectItem value="sp">
                    <Badge className="sp">SP</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Elegí el socio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valorARS"
          render={({field}) => (
            <FormItem>
              <FormLabel>Valor en pesos</FormLabel>
              <FormControl>
                <Input
                  placeholder="0"
                  type="number"
                  {...field}
                  min={0}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Valor en pesos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valorUSD"
          render={({field}) => (
            <FormItem>
              <FormLabel>Valor en dólares</FormLabel>
              <FormControl>
                <Input
                  placeholder="0"
                  type="number"
                  {...field}
                  min={0}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Valor en dólares</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conceptos"
          render={({field}) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="" type="text" {...field} value={field.value} />
              </FormControl>
              <FormDescription>Agrega el concepto del pago</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={!form.formState.isValid || mutation.isPending} type="submit">
          {mutation.isPending ? "Agregando..." : "Agregar pago"}
        </Button>
      </form>
    </Form>
  );
}
