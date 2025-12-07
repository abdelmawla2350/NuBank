"use client";
import { Section } from 'lucide-react'
import React , {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import FormInput from "@/components/ui/FormInput"
 
// Add password to your schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const AuthForm = ({type}:{type:string}) => {
  const [user,setUser] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "", // ← Add this line
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-y-8'> 
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <div className='flex flex-col gap-1 md:gap3'>
          <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
            {user
              ? 'Link Account'
              : type === 'sign-in'
              ? 'Sign In'
              : 'Sign Up'
            }
          </h1>

          <p className='text-16 font-normal text-gray-600'>
            {user
              ? 'Link your existing account.'
              : 'Please enter your details.'
            }
          </p>
        </div>
      </header>

      {user ? (
        <div className='flex flex-col gap-4'>
          {/* plaid link component */}
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
              />

              <FormInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </>
      )}
    </section>
  )
}

export default AuthForm