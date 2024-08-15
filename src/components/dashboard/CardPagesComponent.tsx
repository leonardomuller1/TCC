import HeaderTopDashboard from './HeaderTopDashboardComponent';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const CardPages: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className="bg-gray-50 min-h-screen h-full">
      <HeaderTopDashboard />
      <div
        className={`mt-8 mx-32 p-6 flex flex-col gap-4 border rounded-lg border-gray-200 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default CardPages;
