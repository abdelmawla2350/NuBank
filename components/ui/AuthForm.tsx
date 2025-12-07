"use client";
import Link from 'next/link';
import React, {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import FormInput from "@/components/ui/FormInput"
import Image from 'next/image'
import { Loader2 } from 'lucide-react';
 
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const AuthForm = ({type}:{type:string}) => {
  const [user,setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    setIsLoading(false);
  }

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-y-8'> 
        {/* Bank Logo with Text */}
        <div className="flex flex-col items-center gap-4">
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
              {user
                ? 'Link your existing account.'
                : 'Please enter your details.'
              }
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
                  disabled={isLoading}  // Fixed: removed space before =
                  className="form-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp;
                      Loading...
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

export default AuthForm