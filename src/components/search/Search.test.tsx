import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from './Search';

const resultsBox = () => screen.getByRole('listbox', { hidden: true }).parentElement as HTMLElement;

describe('Search', () => {
  it('opens the result list when the query matches', async () => {
    render(<Search placeholder="How can we help?" />);
    await userEvent.type(screen.getByRole('combobox'), 'account');
    expect(resultsBox()).toHaveClass('block');
    expect(screen.getByText('Search results')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(10);
  });

  it('keeps the list open with "No results found" once it has been opened', async () => {
    render(<Search placeholder="Search" />);
    await userEvent.type(screen.getByRole('combobox'), 'acc');
    await userEvent.type(screen.getByRole('combobox'), 'zzzq');
    expect(resultsBox()).toHaveClass('block');
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('closes when the field is backspaced to empty', async () => {
    render(<Search placeholder="Search" />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'pay');
    await userEvent.type(input, '{Backspace}{Backspace}{Backspace}');
    expect(input).toHaveValue('');
    expect(resultsBox()).toHaveClass('hidden');
  });

  it('clears and closes with the clear button without submitting the form', async () => {
    render(<Search placeholder="Search" />);
    await userEvent.type(screen.getByRole('combobox'), 'account');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });
});
