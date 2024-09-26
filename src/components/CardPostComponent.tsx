import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CardProps {
  title: string;
  link: string;
  alt: string;
  image: string;
  hasAccess: boolean;
}

const CardPost: React.FC<CardProps> = ({ title, link, alt, image, hasAccess }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (hasAccess) {
      navigate(link);
    }
  };

  return (
    <div 
      className={`border rounded-2xl divide-gray-200 p-2 flex flex-col items-center justify-items-center ${
        hasAccess ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <img src={image} alt={alt} className="h-64" />
      <Button
        variant="link"
        className={`text-sm font-semibold ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}
        onClick={handleNavigation}
        disabled={!hasAccess}
      >
        {title}
      </Button>
    </div>
  );
};

export default CardPost;