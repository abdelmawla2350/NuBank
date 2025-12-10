"use client";
import Link from 'next/link';
import React, {use, useEffect, useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import FormInput from "@/components/ui/FormInput"
import Image from 'next/image'
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {  getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions';

const formSchema = (type:string)=> z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3 , { message: "First name must be at least 3 characters" }),
  lastName: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3 , { message: "Last name must be at least 3 characters" }),
  address: type==="sign-in" ? z.string().optional().nullable() : z.string().max(50, { message: "Address must be at most 50 characters" }),
  state: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3, { message: "State must be at least 3 characters" }),
  city: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3, { message: "City must be at least 3 characters" }),
  postalCode: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3, { message: "Postal code must be at least 3 characters" }),
  dateOfBirth: type==="sign-in" ? z.string().optional().nullable() : z.string().min(6, { message: "Date of birth must be at least 6 characters" }),
  ssn: type==="sign-in" ? z.string().optional().nullable() : z.string().min(3, { message: "SSN must be at least 3 characters" }),
})

const AuthForm = ({type}:{type:string}) => {
  const router=useRouter();
  const [user,setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
 const [loggedInUser, setLoggedInUser] = useState<any>(null);

useEffect(() => {
  const fetchUser = async () => {
    const user = await getLoggedInUser();
    setLoggedInUser(user);
  };
  fetchUser();
}, []);

  // ✅ FIXED resolver + type inference
  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(type)),
    defaultValues: type === "sign-in" 
  ? {
      email: "",
      password: "",
    }
  : {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
    }
,
  });

  


const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
  setIsLoading(true);
  try {
    let response;

    if (type === 'sign-up') {
      const newUser = await signUp(values);
      setUser(newUser);
      response = newUser; // ✅ assign so redirect runs
    }

if (type === 'sign-in') {
  const response = await signIn({ email: values.email, password: values.password });
  if (response) router.push('/');
}
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-y-8'>
        <div className="flex flex-col items-start gap-4 w-full">

          <div className="flex items-center justify-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/icons/credit-card.svg"
                alt="Bank Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h2 className="text-24 lg:text-36 font-semibold text-gray-900">
              NU Bank
            </h2>
          </div>

          <div className='flex flex-col gap-1 md:gap-3'>
            <h1 className='text-24 lg:text-36 font-semibold text-gray-900 text-left'>
              {user
                ? 'Link Account'
                : type === 'sign-in'
                ? 'Sign In'
                : 'Sign Up'
              }
            </h1>

            <p className='text-14 font-normal text-gray-600 text-left'>
              {user ? 'Link your existing account.' : 'Please enter your details.'}
            </p>
          </div>
        </div>
      </header>

      {user ? (
        <div className='flex flex-col gap-4'>
          {/* plaid link component */}
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {type==='sign-up' && (
                  <>
                   <div className="flex gap-4"> 
                    <FormInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name"
                    />

                    <FormInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name"
                    />
                    </div>

                    <FormInput
                      control={form.control}
                      name="address"
                      label="Address"
                      placeholder="Enter your specific address"
                    />
                    <FormInput
                      control={form.control}
                      name="city"
                      label="City"
                      placeholder="Enter your city"
                    />
                    <div className="flex gap-4">
                        <FormInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="Cairo"
                    />

                    <FormInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="11011"
                    />
                    </div>
                    <div className="flex gap-4">
                    <FormInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="MM/DD/YYYY"
                    />

                    <FormInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="123-45-6789"
                    />
                    </div>
                  </>
                )}

              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />

              <div className="h-4"></div>

              <FormInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />

              <div className="h-4"></div>

              <div className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="form-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                    </>
                  ) : type === 'sign-in' 
                    ? 'Sign In' 
                    : 'Sign Up'
                  }
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1 mt-6">
            <p className='text-14 font-normal text-gray-600'>
              {type === 'sign-in'  
                ? "Don't have an account?"
                : "Already have an account"
              }
            </p>
            <Link 
              href={type === 'sign-in' ? '/sign-up' : '/sign-in'} 
              className="form-link"
            >
              {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
            </Link>
          </footer>
        </>
      )}
    </section>
  )
}

export default AuthForm;
