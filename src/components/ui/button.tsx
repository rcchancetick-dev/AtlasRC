import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
const variants = cva('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 active:scale-[.97]',{variants:{variant:{default:'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35',outline:'border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--muted)]',ghost:'hover:bg-[var(--muted)]'} ,size:{default:'px-5 py-3 text-sm',sm:'px-3 py-2 text-sm',lg:'px-7 py-4 text-base'}},defaultVariants:{variant:'default',size:'default'}});
type Props=ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof variants>&{asChild?:boolean};
export const Button=forwardRef<HTMLButtonElement,Props>(({className,variant,size,asChild=false,...props},ref)=>{const Comp=asChild?Slot:'button';return <Comp className={cn(variants({variant,size}),className)} ref={ref} {...props}/>}); Button.displayName='Button';
