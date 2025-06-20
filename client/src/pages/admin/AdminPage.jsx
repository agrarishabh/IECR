import React from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AddMovies from '../../components/admin/AddMovies';
import AddWebseries from '../../components/admin/AddWebseries';
import BlurCircle from '../../components/BlurCircle';
import DeleteForm from '../../components/admin/DeleteForm';

const AdminPage = () => {
  return (
    <>
      <AdminNavbar />
      <BlurCircle top='0' right='-80px' />
      
      {/* Row Container for Admin Forms */}
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start px-6 py-10">
        <div className="flex-1">
          <AddMovies />
        </div>
        <div className="flex-1">
          <AddWebseries />
        </div>
        <div className="flex-1">
          <DeleteForm />
        </div>
      </div>

      <BlurCircle bottom='0' left='-80px' />
    </>
  );
};

export default AdminPage;
