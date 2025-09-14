export const ValidationMessage = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={`p-4 rounded mb-4 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {message}
  </div>
);

