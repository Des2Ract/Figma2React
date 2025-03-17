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
      <div className="div_0-wrapper"><div className="div_0"><div className="div_1-wrapper"><div className="div_1"><div className="div_2-wrapper"><div className="div_2"><div className="div_3-wrapper"><div className="div_3"><div className="div_4-wrapper"><div className="div_4"><div className="div_5-wrapper"><div className="div_5"><p className="p_6">Get Started Now</p></div></div><p className="p_7">Enter your Credentials to access your account</p></div></div><div className="div_8-wrapper"><div className="div_8"><div className="div_9-wrapper"><div className="div_9"><div className="div_10-wrapper"><div className="div_10"><p className="p_11">Name</p></div></div><input className="input_12" type="text" placeholder="" /></div></div></div></div><div className="div_15-wrapper"><div className="div_15"><div className="div_16-wrapper"><div className="div_16"><div className="div_17-wrapper"><div className="div_17"><p className="p_18">Email address</p></div></div><input className="input_19" type="text" placeholder="" /></div></div></div></div><div className="div_22-wrapper"><div className="div_22"><div className="div_23-wrapper"><div className="div_23"><div className="div_24-wrapper"><div className="div_24"><p className="p_25">Password</p></div></div><input className="input_26" type="text" placeholder="" /></div></div></div></div><div className="div_29-wrapper"><div className="div_29">
          <input 
            type="checkbox" 
            id="checkbox-tzoi4lt0d" 
          />
        <label 
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          I agree to the terms & policy
        </label>
      </div></div><div className="button_31-wrapper"><button className="button_31" type="button"><div className="div_32-wrapper"><div className="div_32"><div className="button_33-wrapper"><button className="button_33" type="button"><div className="div_34-wrapper"><div className="div_34"><p className="p_35">Name</p></div></div><p className="p_38">Signup</p></button></div></div></div></button></div><div className="div_39-wrapper"><div className="div_39"><div className="div_40-wrapper"><div className="div_40"><div className="div_41-wrapper"><div className="div_41"><p className="p_42">Or</p></div></div><div style={{"display":"flex","width":"400px","height":"0px"}}><hr className="hr_43" /></div></div></div></div></div><div className="div_44-wrapper"><div className="div_44"><div className="button_45-wrapper"><button className="button_45" type="button"><div className="div_46-wrapper"><div className="div_46"><div className="div_47-wrapper"><div className="div_47"></div></div><p className="p_48">Sign in with Google</p></div></div></button></div><div className="button_49-wrapper"><button className="button_49" type="button"><div className="div_50-wrapper"><div className="div_50"><div className="div_51-wrapper"><div className="div_51"></div></div><p className="p_52">Sign in with Apple</p></div></div></button></div></div></div><div className="div_53-wrapper"><div className="div_53"><div className="div_54-wrapper"><div className="div_54"><p className="p_55">Have an account?  Sign In</p></div></div></div></div></div></div></div></div><img className="img_56" src="https://s3-alpha-sig.figma.com/img/c230/ffba/520fab60716f712257d7f6a7fc48a42f?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=X8O9uH-UHlAC0ViSmUr0zWe6A5PKuhUV2qiZk7sMqJ2fxy0K~zajagwaiJ8L9f~26trm8V08DQbdGt4ukFALKrAZyltO7MJCEy-D0eTIDIi0~YixL6EuG7hwsCUSv1lVm6zQ7F9WGX3yD-pVtCbquNTVymEyTb0UoqhYQDuqse97eBCgdWaX2iGgFs9e1bHNrYx5TdCMB0lkBQFshoGl8gVr-o7BTS0TH~kJOGpOyavZneHo2Wm9ZLPF464dindHvIaU0E9owCQNGf8ryfE9~O-PLI-uYPiDEmqfY0eL85yFLOIN51jet4qsqNPf4pCPOTG70G8VbMBwbu2iwkm8pw__" alt="" /></div></div></div></div>
    </body>
  );
};

export default FigmaComponent;
