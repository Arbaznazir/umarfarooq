import FaviconHead from "./FaviconHead";

export default function Layout({ children }) {
  return (
    <>
      <FaviconHead />
      {children}
    </>
  );
}
