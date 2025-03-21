const Footer = () => {
  return ( 
    <footer className="w-full py-4 px-6 md:px-10 absolute bottom-0 left-0 z-20 flex items-center justify-center text-gray-500 text-sm hover:text-primary transition-colors">
      <p>© {new Date().getFullYear()} RubiksMaster. vibecoded with luv.</p>
    </footer>
  );
};

export default Footer; 