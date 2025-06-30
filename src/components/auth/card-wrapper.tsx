"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from "@/components/ui/card";
import AuthHeader from "./auth-header";
import BackButton from "./back-button";
import ForgetButton from "./forget-password";



interface CardWrapperProps {
    label: string
    title: string
    backButtonHref: string
    backButtonLabel: string 
    children: React.ReactNode
    showForgetButton?: boolean;
}

const CardWrapper = ({ label, title, backButtonHref,  backButtonLabel,  children, showForgetButton = true }: CardWrapperProps) => {
  return (
    <Card className="xl:w-1/3 md:w-1/2 shadow-md">
        <CardHeader>
        <AuthHeader label={label} title={title} />
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-center">
            <BackButton label={backButtonLabel} href={backButtonHref} />
            { showForgetButton && <ForgetButton /> }
        </CardFooter>
        
    </Card>
  )
}

export default CardWrapper