import type { ButtonHTMLAttributes } from 'react';

export type ButtonStyle =
  | 'btn-primary-solid'
  | 'btn-secondary-solid'
  | 'btn-secondary-outline'
  | 'btn-terciary-solid'
  | 'btn-terciary-outline'
  | 'btn-ghost-solid'
  | 'btn-white-outline'
  | 'btn-alert-info'
  | 'btn-link';

export type ButtonSize = 'btn-sm' | 'btn-md' | 'btn-lg';

export type ButtonWidth = 'w-full' | 'w-auto' | 'w-full sm:w-auto';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
  buttonWidth?: ButtonWidth;
}

/** Design-system button. Variants map to `.btn-*` classes in `styles/components/button.css`. */
export const Button = ({
  buttonStyle = 'btn-primary-solid',
  buttonSize = 'btn-md',
  buttonWidth = 'w-full',
  type = 'button',
  children,
  ...rest
}: ButtonProps) => (
  <button type={type} className={`btn ${buttonWidth} ${buttonStyle} ${buttonSize}`} {...rest}>
    {children}
  </button>
);
