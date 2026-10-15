import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('defaults to a full-width primary medium non-submit button', () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn', 'w-full', 'btn-primary-solid', 'btn-md');
  });

  it('applies the requested variant classes', () => {
    render(
      <Button buttonStyle="btn-ghost-solid" buttonSize="btn-sm" buttonWidth="w-auto">
        Go
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('w-auto', 'btn-ghost-solid', 'btn-sm');
  });
});
