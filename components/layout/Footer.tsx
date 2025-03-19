const Footer = () => {
  return (
    <footer className="w-full py-4 px-6 md:px-10 bg-background border-t border-border text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} RubiksMaster. All rights reserved.</p>
    </footer>
  );
};

export default Footer; 