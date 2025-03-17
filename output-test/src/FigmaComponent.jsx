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
      <div className="div_0-wrapper"><div className="div_0"><img className="img_1" src="https://i.pinimg.com/736x/32/2a/86/322a8676d4cbf0794be7de0d97a3f837.jpg" alt="" /><div className="navbar_2-wrapper"><nav className="navbar_2"><a href="#des2ract" className="p_3">DES2RACT</a><a href="#home" className="p_4">Home</a><a href="#services" className="p_5">Services</a><a href="#contact-us" className="p_6">Contact Us</a><button className="button_7" type="button"><p className="p_8">Sign In</p></button></nav></div><p className="p_9">AOZ Website</p><div style={{"display":"flex","width":"176px","height":"0px"}}><hr className="hr_10" /></div><div className="div_11-wrapper"><div className="div_11"><p className="p_12">Sign in</p><div className="div_13-wrapper"><div className="div_13"><p className="p_14">UserName</p><input className="input_15" type="text" placeholder="eg. AOZ2025" /></div></div><div className="div_17-wrapper"><div className="div_17"><p className="p_18">Password</p><input className="input_19" type="text" placeholder="" /></div></div><div className="div_20-wrapper"><div className="div_20">
          <input 
            type="checkbox" 
            id="checkbox-vvi0rzceg" 
          />
        <label 
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          Agree to the Terms and Conditions
        </label>
      </div></div><button className="button_22" type="button"><p className="p_23">Sign In</p></button></div></div></div></div>
    </body>
  );
};

export default FigmaComponent;
