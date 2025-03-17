import React from 'react';
import './styles.css';

const FigmaComponent = () => {
  React.useEffect(() => {
    // Ensure proper responsive behavior
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <body className="figma-container">
      <div className="div_0-wrapper"><div className="div_0"><p className="p_1">AOZ Website</p><div className="div_2-wrapper"><div className="div_2"><p className="p_3">Sign in</p><div className="div_4-wrapper"><div className="div_4"><p className="p_5">UserName</p><input className="input_6" type="text" placeholder="" /></div></div><div className="div_8-wrapper"><div className="div_8"><p className="p_9">Password</p><input className="input_10" type="text" placeholder="" /></div></div><div className="div_11-wrapper"><div className="div_11"><div className="checkbox_12-wrapper"><div className="checkbox_12"></div></div><p className="p_13">Agree to the Terms and Conditions</p></div></div><button className="button_14" type="button"><p className="p_15">Sign In</p></button></div></div></div></div>
    </body>
  );
};

export default FigmaComponent;
