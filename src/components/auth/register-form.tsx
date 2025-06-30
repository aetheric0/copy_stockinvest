"use client";

import CardWrapper from "./card-wrapper";
import ReCAPTCHA from "react-google-recaptcha";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RegisterSchema } from "@root/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import type { z } from "zod";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    UserIcon,
    MailIcon,
    LockIcon,
    PhoneIcon,
    MapPinIcon,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Country {
    name: {
        common: string;
    };
    cca2: string;
}

type FormData = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [registrationError, setRegistrationError] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null); // Changed from recaptchaLoading

    const form = useForm<FormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: "",
            fullname: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            country: "",
            referralID: "",
        },
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get<Country[]>(
                    "https://restcountries.com/v3.1/all?fields=name,cca2"
                );
                setCountries(response.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setFetchError("Failed to load countries. Please try again later.");
            }
        };

        fetchCountries();
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setRegistrationError(null);
        setRegistrationSuccess(false);

        if (!recaptchaValue) { // Changed from executeRecaptcha check
            setLoading(false);
            setRegistrationError("Please complete the CAPTCHA verification");
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    recaptchaToken: recaptchaValue, // Using the v2 token
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log("Registration successful:", responseData);
                setRegistrationSuccess(true);
                form.reset();
                setTimeout(() => router.push("/auth/login"), 2000);
            } else {
                console.error("Registration failed:", responseData);
                setRegistrationError(
                    responseData.error || responseData.message || "Registration failed"
                );
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setRegistrationError(
                error instanceof Error ? error.message : "An unexpected error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardWrapper
            label="Create an Account"
            title="Register"
            backButtonHref="/auth/login"
            backButtonLabel="Already have an account? Login Here"
            showForgetButton={false} 
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Username <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <UserIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="Enter your username"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Full Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <UserIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="John Doe"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MailIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="johndoe@email.com"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Password <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <LockIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="********"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Confirm Password <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <LockIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="********"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <PhoneIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="tel"
                                                placeholder="+*** **** *** ***"
                                                className="pl-10 h-10 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Country <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={countries.length === 0 || fetchError !== null}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="pl-10 h-10 w-full">
                                                        <SelectValue placeholder="Select your country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {fetchError && <div>{fetchError}</div>}
                                                    {countries.map((country) => (
                                                        <SelectItem
                                                            key={country.cca2}
                                                            value={country.name.common}
                                                        >
                                                            {country.name.common}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="referralID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referral ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Optional ID"
                                            className="h-10 text-lg"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={(token: string | null) => setRecaptchaValue(token)}
                        onExpired={() => setRecaptchaValue(null)}
                    />
                    {registrationError && (
                        <p className="text-red-500">{registrationError}</p>
                    )}

                    {registrationSuccess && (
                        <p className="text-green-500">Registration successful!</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            loading ||
                            !recaptchaValue || // Changed from recaptchaLoading
                            countries.length === 0 ||
                            fetchError !== null
                        }
                    >
                        {loading ? "Processing..." : "Register"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default RegisterForm;
