import { useNavigate } from 'react-router-dom';

//componentes
import { Button } from '@/components/ui/button';

//interface
interface CardProps {
  title: string;
  link: string;
  alt: string;
  image: string;
}

const CardPost: React.FC<CardProps> = ({ title, link, alt, image }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(link);
  };

  return (
    <div className="border rounded-2xl divide-gray-200 p-2 flex flex-col items-center justify-items-center hover:bg-gray-100">
      <img src={image} alt={alt} className="h-full" />
      <Button
        variant="link"
        className="text-gray-900 text-sm font-semibold"
        onClick={handleNavigation}
      >
        {title}
      </Button>
    </div>
  );
};

export default CardPost;
