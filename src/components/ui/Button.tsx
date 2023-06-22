import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, FC } from 'react'



export const buttonVariants = cva(
  "active:scale-95 inline-flex items-center justify-center rounded-full text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 hover:-translate-y-2 transition-all duration-300 ease-in-out hover:shadow-lg text-white",
        ghost: "bg-transparent hover:bg-gray-50 hover:text-gray-700",
      },
      sizes: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      sizes: "default",
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { 
  isLoading?: boolean
}

const Button: FC<ButtonProps> = ({className, children,variant, isLoading,sizes,...props }) => {
  return (<button className={cn(buttonVariants({variant,sizes,className}))} disabled={isLoading} {...props}>
    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
    {children}
  </button>)
}

export default Button