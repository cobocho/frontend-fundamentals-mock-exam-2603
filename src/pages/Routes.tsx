import { Suspense } from 'react';
import { ReservationStatusPage } from './ReservationStatusPage';
import { RoomBookingPage } from './RoomBookingPage';
import { Route, Routes as ReactRouterRoutes, Navigate } from 'react-router-dom';

export const Routes = () => {
  return (
    <Suspense>
      <ReactRouterRoutes>
        <Route path="/" element={<ReservationStatusPage />} />
        <Route path="/booking" element={<RoomBookingPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </ReactRouterRoutes>
    </Suspense>
  );
};
