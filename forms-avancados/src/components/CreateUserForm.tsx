"use client"

import { useState } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from "@/libs/supabase"
import { Form } from './Form'
import { PlusCircle, XCircle } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createUserSchema = z.object({
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
  avatar: z.instanceof(FileList)
  .refine((files) => !!files.item(0), "A imagem de perfil é obrigatória")
  .refine((files) => files.item(0)!.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
  .refine(
    (files) => ACCEPTED_IMAGE_TYPES.includes(files.item(0)!.type),
    "Formato de imagem inválido"
  ).transform(files => {
    return files.item(0)!
  }),
})

type CreateUserData = z.infer<typeof createUserSchema>

export function CreateUserForm() {
  const [output, setOutput] = useState('')

  const createUserForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema)
  })

  const {
    handleSubmit,
    control,
    watch,
  } = createUserForm

  const userPassword = watch('password')
  const isPasswordStrong = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})').test(userPassword)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  })

  function addNewTech() {
    append({ title: '', knowledge: 1 })
  }

  async function createUser(data: CreateUserData) {
    const upload = await supabase
      .storage
      .from('forms-react')
      .upload(`avatars/${data.avatar?.name}`, data.avatar, {
        cacheControl: '3600',
        upsert: false
      })
    
      console.log(upload)

    setOutput(JSON.stringify(data, null, 2))
  }

  return (
    <div className="flex gap-10 max-w-md w-full">
      <FormProvider {...createUserForm}>
        <form
          onSubmit={handleSubmit(createUser)}
          className="bg-zinc-800 flex flex-col gap-4 p-8 rounded-lg"
        >
          <h1 className="text-2xl text-center font-bold">Cadastre-se</h1>

          <Form.Field className="flex flex-col gap-1">
            <Form.Label htmlFor="avatar">
              Avatar
            </Form.Label>

            <Form.Input type="file" name="avatar" />

            <Form.ErrorMessage field="avatar" />
          </Form.Field >

          <Form.Field  className="flex flex-col gap-1">
            <Form.Label htmlFor="name">
              Nome
            </Form.Label>

            <Form.Input type="name" name="name" />

            <Form.ErrorMessage field="name" />
          </Form.Field >

          <Form.Field  className="flex flex-col gap-1">
            <Form.Label htmlFor="email">
              E-mail
            </Form.Label>
            
            <Form.Input type="email" name="email" />

            <Form.ErrorMessage field="email" />
          </Form.Field >

          <Form.Field  className="flex flex-col gap-1">
            <Form.Label htmlFor="password">
              Senha

              {isPasswordStrong 
                ? <span className="text-xs text-emerald-600">Senha forte</span>
                : <span className="text-xs text-red-500">Senha fraca</span>}
            </Form.Label>
          
            <Form.Input type="password" name="password" />

            <Form.ErrorMessage field="password" />
          </Form.Field >

          <Form.Field  className="flex flex-col gap-1">
            <Form.Label>
              <div>
                Tecnologias: <span className="text-xs">{'(Min. 2)'}</span>
              </div>

              <button 
                type="button" 
                onClick={addNewTech}
                className="text-emerald-500 font-semibold text-xs flex items-center gap-1"
              >
                Adicionar nova
                <PlusCircle size={14} />
              </button>
            </Form.Label>

            <Form.ErrorMessage field="techs" />

            {fields.map((field, index) => {
              const fieldNameTitle = `techs.${index}.title`
              const fieldNameKnowledge = `techs.${index}.knowledge`

              return (
                <div key={field.id} className="flex gap-2 relative">
                  <Form.Field>
                    <Form.Input type={fieldNameTitle} name={fieldNameTitle} />
                    
                    <Form.ErrorMessage field={fieldNameTitle} />
                  </Form.Field>

                  <Form.Field>
                    <div className="w-16 flex flex-col gap-1">
                      <Form.Input type={fieldNameKnowledge} name={fieldNameKnowledge} />

                      <button
                        type="button" 
                        onClick={() => remove(index)}
                        className="text-red-500 absolute top-3 right-0"
                      >
                        <XCircle size={14} />
                      </button>
                      
                      <Form.ErrorMessage field={fieldNameKnowledge} />
                    </div>
                  </Form.Field>
                </div>
              )
            })}  
          </Form.Field >

          <button
            type="submit"
            className="bg-violet-500 rounded font-semibold text-white h-10 hover:bg-violet-600 transition"
          >
            Salvar
          </button>
        </form>
      </FormProvider>
      <pre>{output}</pre>
    </div>
  )
}