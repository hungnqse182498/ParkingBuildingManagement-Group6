import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  icon?: LucideIcon
}

export default function FormField({ label, name, icon: Icon, id, ...props }: FormFieldProps) {
  const inputId = id ?? name

  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-with-icon">
        {Icon && <Icon size={16} aria-hidden />}
        <input id={inputId} name={name} {...props} />
      </div>
    </div>
  )
}
