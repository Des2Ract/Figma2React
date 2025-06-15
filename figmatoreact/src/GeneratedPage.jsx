import React from 'react';
import Navbar from './components/Navbar';
import Form from './components/Form';
import Label from './components/Label';
import Input from './components/Input';
import Checkbox from './components/Checkbox';
import Button from './components/Button';
import Typography from './components/Typography';

export default function GeneratedPage() {
  return (
    <div className="relative w-[668px] h-[579px] mx-auto">
          <div className="relative" style={{ width: "668px", height: "579px" }}>
      <div className="relative" style={{ width: "668px", height: "579px", backgroundColor: "rgba(255,255,255,1)" }}>
        <div className="relative" style={{ width: "668px", height: "579px", backgroundColor: "rgba(219,215,215,1)" }}>
          <Navbar brand="DES2RACT" items={["Home","Services","Contact Us"]} style={{ width: "668px", height: "49px" }} />
          <div className="relative" style={{ width: "510px", height: "434px" }}>
            <div className="relative" style={{ position: "absolute", left: "0px", top: "0px", width: "176px", height: "29px" }}>
              <Typography.Text children="AOZ Website" style={{ position: "absolute", left: "22px", top: "0px", width: "127px", height: "29px", fontFamily: "Permanent Marker, cursive", fontSize: "15px", color: "rgba(0,0,0,1)", backgroundColor: "transparent" }}>AOZ Website</Typography.Text>
              <hr style={{ position: "absolute", left: "0px", top: "26px", border: "none", borderTop: "1px solid currentColor", margin: "0" }} />
            </div>
            <div className="relative" style={{ position: "absolute", left: "100px", top: "38px", width: "410px", height: "396px", backgroundColor: "rgba(255,255,255,1)", borderRadius: "15px" }}>
              <div className="relative" style={{ position: "absolute", left: "65px", top: "26px", width: "279px", height: "122px" }}>
                <Typography.Text children="Sign in" style={{ position: "absolute", left: "72px", top: "0px", width: "135px", height: "41px", fontFamily: "Permanent Marker, cursive", fontSize: "15px", color: "rgba(0,0,0,1)", backgroundColor: "transparent" }}>Sign in</Typography.Text>
                <div className="relative" style={{ position: "absolute", left: "0px", top: "62px", width: "279px", height: "60px", borderRadius: "10px" }}>
                  <Label children="UserName" htmlFor="username" style={{ position: "absolute", left: "5px", top: "0px", width: "68px", height: "18px", fontFamily: "Permanent Marker, cursive", fontSize: "15px", color: "rgba(0,0,0,1)", backgroundColor: "transparent" }}>UserName</Label>
                  <Input placeholder="eg. AOZ2025" type="text" style={{ position: "absolute", left: "0px", top: "21px", width: "279px", height: "39px", backgroundColor: "rgba(255,255,255,1)", border: "1px solid rgba(0,0,0,1)", borderRadius: "10px", padding: "8px 12px", outline: "none" }} />
                </div>
              </div>
              <div className="relative" style={{ position: "absolute", left: "65px", top: "189px", width: "279px", height: "60px", borderRadius: "10px" }}>
                <Label children="Password" htmlFor="password" style={{ position: "absolute", left: "5px", top: "0px", width: "68px", height: "18px", fontFamily: "Permanent Marker, cursive", fontSize: "15px", color: "rgba(0,0,0,1)", backgroundColor: "transparent" }}>Password</Label>
                <Input type="text" style={{ position: "absolute", left: "0px", top: "21px", width: "279px", height: "39px", backgroundColor: "rgba(255,255,255,1)", border: "1px solid rgba(0,0,0,1)", borderRadius: "10px", padding: "8px 12px", outline: "none" }} />
              </div>
              <div className="relative" style={{ position: "absolute", left: "77px", top: "277px", width: "262px", height: "86px" }}>
                <div className="relative" style={{ position: "absolute", left: "0px", top: "0px", width: "262px", height: "15px" }}>
                  <Checkbox type="checkbox" style={{ position: "absolute", left: "0px", top: "0px", width: "15px", height: "15px", backgroundColor: "rgba(217,217,217,1)", border: "1px solid rgba(0,0,0,1)" }} />
                  <Typography.Text children="Agree to the Terms and Conditions" style={{ position: "absolute", left: "24px", top: "0px", width: "238px", height: "15px", fontFamily: "Permanent Marker, cursive", fontSize: "15px", color: "rgba(0,0,0,1)", backgroundColor: "transparent", whiteSpace: "nowrap" }}>Agree to the Terms and Conditions</Typography.Text>
                </div>
                <Button style={{ position: "absolute", left: "15px", top: "34px", width: "226px", height: "52px", backgroundColor: "rgba(172,177,228,1)", border: "1px solid rgba(0,0,0,1)", borderRadius: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(172,177,228,1)" }} />
              </div>
            </div>
          </div>
          <div className="relative" style={{ width: "50px", height: "24px" }}>
            <div className="relative" style={{ position: "absolute", left: "0px", top: "0px", width: "50px", height: "10px" }} />
            <div className="relative" style={{ position: "absolute", left: "0px", top: "14px", width: "50px", height: "10px" }} />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
