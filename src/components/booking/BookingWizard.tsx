"use client";

import { useState } from "react";
import { format } from "date-fns";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schemas
const detailsSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    whatsappNumber: z.string().min(10, "Valid WhatsApp number is required"),
    groupSize: z.coerce.number().min(1).max(20),
    specialRequests: z.string().optional(),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

export interface BookingWizardProps {
    guide: any;
    onClose: () => void;
}

export function BookingWizard({ guide, onClose }: BookingWizardProps) {
    const [step, setStep] = useState(1);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<any>({
        // @ts-ignore - Supress version mismatch between zod and hookform resolvers
        resolver: zodResolver(detailsSchema) as any,
        defaultValues: {
            fullName: "",
            whatsappNumber: "",
            groupSize: 1,
            specialRequests: "",
        },
    });

    const calculateTotal = () => {
        let days = 1;
        if (dateRange.from && dateRange.to) {
            const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start/end
        }

        // Base day rate (assuming guide has a base rate, using the first service or flat rate for now)
        let total = guide.pricePerDay * days;

        // Add additional fixed services
        selectedServices.forEach(srvId => {
            const srv = guide.services.find((s: any) => s.id === srvId);
            if (srv && srv.priceType === 'fixed') {
                total += srv.price;
            }
        });

        return total;
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guideId: guide.id,
                    title: `Booking for ${guide.name.split(' ')[0]}`,
                    travelerDetails: data,
                    selectedServices,
                    dates: dateRange,
                    totalAmount: calculateTotal(),
                })
            });

            if (res.ok) {
                setStep(4);
            } else {
                console.error("Booking failed");
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {step === 4 ? "Booking Requested!" : `Book ${guide.name.split(' ')[0]}`}
                        </h2>
                        {step < 4 && (
                            <p className="text-sm text-slate-500 font-medium">Step {step} of 3</p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Dynamic Content Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">When are you traveling?</h3>
                                <p className="text-sm text-slate-500">Select your preferred dates.</p>
                            </div>
                            <div className="border rounded-2xl p-4 flex justify-center bg-slate-50 dark:bg-slate-800/50">
                                <Calendar
                                    mode="range"
                                    selected={{
                                        from: dateRange.from,
                                        to: dateRange.to
                                    }}
                                    onSelect={(range: any) => setDateRange(range)}
                                    numberOfMonths={1}
                                    className="bg-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Select additional services</h3>
                                <p className="text-sm text-slate-500">Customize your experience.</p>
                            </div>
                            <div className="space-y-3">
                                {guide.services.map((service: any) => (
                                    <label
                                        key={service.id}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${selectedServices.includes(service.id)
                                            ? "border-primary bg-primary/5"
                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedServices.includes(service.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedServices([...selectedServices, service.id]);
                                                } else {
                                                    setSelectedServices(selectedServices.filter(id => id !== service.id));
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-slate-900 dark:text-white">{service.title}</span>
                                                <span className="font-bold">৳{service.price}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Traveler Details</h3>
                                <p className="text-sm text-slate-500">We will connect you via WhatsApp.</p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" className="h-12 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="whatsappNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>WhatsApp Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+880..." className="h-12 rounded-xl" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="groupSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Group Size</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={1} className="h-12 rounded-xl" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="specialRequests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Special Requests</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Allergies, specific spots you want to visit..."
                                                        className="resize-none rounded-xl"
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Submit Button inside form for Step 3 */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-6">
                                        <div>
                                            <p className="text-sm text-slate-500">Total amount (Est.)</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">৳{calculateTotal()}</p>
                                        </div>
                                        <Button type="submit" size="lg" className="h-12 px-8 rounded-xl" disabled={isSubmitting}>
                                            {isSubmitting ? "Requesting..." : "Request Booking"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Requested!</h3>
                            <p className="text-slate-500 max-w-sm">
                                We have notified {guide.name.split(' ')[0]}. Our Ops team will create a WhatsApp group with you and the guide shortly to finalize the details and payment.
                            </p>
                            <Button onClick={onClose} size="lg" className="h-12 px-8 rounded-xl mt-8 w-full sm:w-auto">
                                Go to Dashboard
                            </Button>
                        </div>
                    )}

                </div>

                {/* Footer Navigation (Steps 1 & 2) */}
                {step < 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                            className="rounded-xl"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !dateRange.from}
                            className="rounded-xl"
                        >
                            Continue
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}
