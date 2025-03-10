import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';

const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src="" alt="" />
                </div>
                <div className="footer-content-center">
                    <h2>Company</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>การติดต่อ</h2>
                    <ul>
                        <li>02484488</li>
                        <li>contact@online.com</li>
                    </ul>
                </div>
            </div>
            <hr />
            <p className="footer-copyright">
                Copyright {new Date().getFullYear()} @ onlinefood - All Rights Reserved.
            </p>
        </div>
    );
};

export default Footer;