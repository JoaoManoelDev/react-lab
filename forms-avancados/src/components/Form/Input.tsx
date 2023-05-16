import { InputHTMLAttributes } from "react"
import { useFormContext } from "react-hook-form"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
}

export function Input(props: InputProps) {
  const { register } = useFormContext()

  return (
    <input
      className="flex-1 rounded border border-zinc-300 shadow-sm px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-zinc-50"
      id={props.name}
      type="text"
      {...register(props.name)}
      {...props}
    />
  )
}