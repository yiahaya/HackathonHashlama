import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopNavBar } from './TopNavBar';

describe('TopNavBar', () => {
  it('renders the brand logo text', () => {
    render(<TopNavBar />);
    expect(screen.getByText(/עמותת "הצעד הבא"/i)).toBeInTheDocument();
  });

  it('renders the contact us link', () => {
    render(<TopNavBar />);
    const link = screen.getByText('צור קשר');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#contact');
  });
});
