import React from 'react';

const Footer = () => {
  return (
    <div className="bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul>
            <li className="mb-2"><a href="#" className="hover:underline">About Us</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Careers</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Blog</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul>
            <li className="mb-2"><a href="#" className="hover:underline">Help Center</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Safety Center</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Community Guidelines</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul>
            <li className="mb-2"><a href="#" className="hover:underline">Cookies Policy</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
          <p className="mb-4">Get the latest updates and offers.</p>
          <form className="flex gap-1 flex-col  ">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-3 py-2 rounded-md text-black focus:outline-none bg-amber-50" 
            />
            <button 
              type="submit" 
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-350"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="mt-10 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} YourCompany. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
