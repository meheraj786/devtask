const Footer = () => {
  const date= new Date().getFullYear();
  return (
    <div className="text-xs md:text-right text-center md:fixed bottom-5 right-10 mt-5 opacity-70">
        <p className="text-xs md:text-right text-center">
          &copy; {date} <a className="text-slate-300" href="github.com/meheraj786">Meheraj H.</a>. All rights reserved.
        </p>
    </div>
  );
};

export default Footer;
