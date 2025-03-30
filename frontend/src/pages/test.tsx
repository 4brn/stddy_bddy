import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function Test() {
  const navigate = useNavigate();
  const params = useParams();

  const id = Number(params.id);
  useEffect(() => {
    if (isNaN(id)) navigate("/404");
  }, []);

  return (
    <>
      <h1>Test </h1>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa ab
        commodi ipsam quas totam velit cum. Iusto dolor alias sequi error
        voluptatum, corrupti excepturi quisquam adipisci, maiores dolorum
        ratione aliquam!
      </p>
    </>
  );
}
