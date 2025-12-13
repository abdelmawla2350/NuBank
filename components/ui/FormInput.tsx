
"use client";
import React from 'react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"

interface FormInputProps {
  control: Control<any>
  name: string
  label: string
  placeholder?: string
  type?: string
  className?: string
}

const FormInput = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className = "",
}: FormInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`form-item ${className}`}>
          <FormLabel className='form-label'>
            {label}
          </FormLabel>

          <div className='flex w-full flex-col'>
            <FormControl>
              <Input
                placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                className='input-class'
                type={name==='password' ? 'password' : 'text'}
                {...field}
              />
            </FormControl>

            <FormMessage className='form-message mt-2' />
          </div>
        </FormItem>
      )}
    />
  )
}

export default FormInput