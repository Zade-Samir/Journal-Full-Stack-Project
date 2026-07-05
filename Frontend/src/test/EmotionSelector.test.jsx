import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmotionSelector } from '../components/EmotionSelector';
import { expect, test, describe, vi } from 'vitest';

describe('EmotionSelector', () => {
  test('renders all emotion options', () => {
    render(<EmotionSelector selected="" onSelect={() => {}} />);
    
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Sad')).toBeInTheDocument();
    expect(screen.getByText('Stressed')).toBeInTheDocument();
    expect(screen.getByText('Motivated')).toBeInTheDocument();
  });

  test('calls onSelect with correct emotion id on click', () => {
    const handleSelect = vi.fn();
    render(<EmotionSelector selected="" onSelect={handleSelect} />);
    
    fireEvent.click(screen.getByText('Happy'));
    expect(handleSelect).toHaveBeenCalledWith('happy');
    
    fireEvent.click(screen.getByText('Sad'));
    expect(handleSelect).toHaveBeenCalledWith('sad');
  });

  test('applies active styling to selected emotion', () => {
    render(<EmotionSelector selected="motivated" onSelect={() => {}} />);
    
    const motivatedButton = screen.getByText('Motivated').closest('button');
    expect(motivatedButton).toHaveClass('bg-brand');
    
    const happyButton = screen.getByText('Happy').closest('button');
    expect(happyButton).not.toHaveClass('bg-brand');
  });
});
