interface ExportCSVButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export const ExportCSVButton = ({ onExport, disabled = false }: ExportCSVButtonProps) => (
  <button
    onClick={onExport}
    className={`py-2 px-4 rounded transition-colors ${
      disabled
        ? 'bg-gray-400 text-white cursor-not-allowed'
        : 'bg-green-600 text-white hover:bg-green-700'
    }`}
    disabled={disabled}
  >
    Exportar a CSV
  </button>
);

