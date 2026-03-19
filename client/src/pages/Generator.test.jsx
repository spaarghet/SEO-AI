import { render, screen } from '@testing-library/react';
import Generator from './Generator';
import { AuthContext } from '../context/AuthContext';

test('renders generator title and form inputs', () => {
    const mockUser = { email: 'test@user.com', quota: 5, used: 0 };
    render(
        <AuthContext.Provider value={{ user: mockUser }}>
            <Generator />
        </AuthContext.Provider>
    );
    expect(screen.getByText(/SEO Content Generator/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Keyword/i)).toBeInTheDocument();
});