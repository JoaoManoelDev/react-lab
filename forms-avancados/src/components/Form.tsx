"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from "@/libs/supabase"

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList)
    .transform(list => list.item(0)!)
    .refine(file => file.size <= 5 * 1024 * 1024, 'O arquivo precisa ter no máximo 5Mb.'),
  name: z.string()
    .nonempty('Nome obrigatório.')
    .transform(name => {
      return name.trim().split(" ").map(word => {
        return word[0].toLocaleUpperCase().concat(word.substring(1))
      }).join(" ")
    }),
  email: z.string()
    .nonempty('E-mail obrigatório.')
    .email('Formato de e-mail inválido.')
    .refine(email => {
      return email.endsWith("@email.com")
    }, 'O e-mail precisa ser do email.'),
  password: z.string()
    .min(6, 'A senha precisa de no mínimo 6 caracteres.'),
  techs: z.array(z.object({
    title: z.string().nonempty('Título obrigatório.'),
    knowledge: z.coerce.number().min(1).max(100),
  }))
    .min(2, 'Insira ao menos 2 techs.')
    .refine(techs => {
      return techs.some(tech => tech.knowledge > 70)
    }, 'Vocẽ ainda está aprendendo.'),
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

export function Form() {
  const [output, setOutput] = useState('')
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  })

  function addNewTech() {
    append({ title: '', knowledge: 1 })
  }

  async function createUser(data: CreateUserFormData) {
    await supabase.storage.from('forms-react').upload(data.avatar.name, data.avatar)

    setOutput(JSON.stringify(data, null, 2))
  }

  return (
    <div className="flex gap-10 max-w-md w-full">
      <form
        onSubmit={handleSubmit(createUser)}
        className="bg-zinc-800 flex flex-col gap-4 p-8 rounded-lg"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            accept="image/*"
            {...register('avatar')}
          />
          {errors.avatar && (
            <span className="text-red-500 text-xs">{errors.avatar.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            className="border border-zinc-900 shadow-sm rounded h-10 text-zinc-700 px-3"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-red-500 text-xs">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            className="border border-zinc-900 shadow-sm rounded h-10 text-zinc-700 px-3"
            {...register('email')}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            className="border border-zinc-900 shadow-sm rounded h-10 text-zinc-700 px-3"
            {...register('password')}
          />
          {errors.password && (
            <span className="text-red-500 text-xs">{errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="" className="flex items-center justify-between">
            Tecnologias:

            <button
              onClick={addNewTech}
              className="text-emerald-500 text-sm"
              type="button"
            >
              Adicionar
            </button>
          </label>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    className="border border-zinc-900 shadow-sm rounded h-10 text-zinc-700 px-3"
                    placeholder="Nome da tecnologia"
                    {...register(`techs.${index}.title`)}
                    />
                  
                  {errors.techs?.[index]?.title && (
                    <span className="text-red-500 text-xs">{errors.techs?.[index]?.title?.message}</span>
                  )}
                </div>

                <div className="w-16 flex flex-col gap-1">
                  <input
                    type="number"
                    className=" border border-zinc-900 shadow-sm rounded h-10 text-zinc-700 px-3"
                    {...register(`techs.${index}.knowledge`)}
                    />

                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-red-500 text-xs">{errors.techs?.[index]?.knowledge?.message}</span>
                  )}
                </div>
              </div>
            )
          })}


          {errors.techs && (
            <span className="text-red-500 text-xs">{errors.techs.message}</span>
          )}

        </div>

        <button
          type="submit"
          className="bg-violet-500 rounded font-semibold text-white h-10 hover:bg-violet-600 transition"
        >
          Salvar
        </button>
      </form>

      <pre>{output}</pre>
    </div>
  )
}