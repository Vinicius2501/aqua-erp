const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-accent-foreground">
      <div className="text-center">
        <h1 className="text-muted-foreground mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Voltar para tela inicial
        </a>
      </div>
    </div>
  );
};

export default NotFound;
