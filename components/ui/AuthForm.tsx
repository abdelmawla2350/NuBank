"use client";
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
 
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const AuthForm = ({type}:{type:string}) => {
  const [user,setUser] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-y-8'> 
        {/* Bank Logo with Text */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/icons/credit-card.svg" // Path relative to your AuthForm.tsx location
                alt="Bank Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h2 className="text-28 lg:text-36 font-bold text-gray-900">
              NU Bank
            </h2>
          </div>
          
          <div className='flex flex-col gap-1 md:gap-3'>
            <h1 className='text-24 lg:text-36 font-semibold text-gray-900 text-center'>
              {user
                ? 'Link Account'
                : type === 'sign-in'
                ? 'Sign In'
                : 'Sign Up'
              }
            </h1>

            <p className='text-16 font-normal text-gray-600 text-center'>
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
                type="password" // Add this back for password field
              />

              <div className="h-4"></div>

              <Button type="submit" className="w-full">
                {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </>
      )}
    </section>
  )
}

export default AuthForm