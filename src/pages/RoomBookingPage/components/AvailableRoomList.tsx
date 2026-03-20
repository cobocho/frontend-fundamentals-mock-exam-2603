import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { GetReservationsRequest, reservationQueries, type ReservationSearch } from 'services/reservation';
import { RoomOption } from 'services/room';
import type { Room } from 'services/room/api';
import { css } from '@emotion/react';
import { Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { combineFilters, byFloor, byMinCapacity, byEquipment, byAvailableTime } from './AvailableRoomList.lib';

interface AvailableRoomListProps {
  rooms: Room[];
  filters: ReservationSearch;
  defaultSelectedRoomId?: Room['id'] | null;
  onSelect: (room: Room) => void;
}

export const AvailableRoomList = ({ rooms, filters, defaultSelectedRoomId, onSelect }: AvailableRoomListProps) => {
  const { data: reservations } = useSuspenseQuery(reservationQueries.list({ date: filters.date }));

  const [selectedRoomId, setSelectedRoomId] = useState(defaultSelectedRoomId);

  const availableRooms = useMemo(() => {
    const activeFilters = [byMinCapacity(filters.attendees), byAvailableTime(reservations, filters.start, filters.end)];

    if (filters.preferredFloor != null) {
      activeFilters.push(byFloor(filters.preferredFloor));
    }

    if (filters.equipment.length > 0) {
      activeFilters.push(byEquipment(filters.equipment));
    }

    return rooms.filter(combineFilters(...activeFilters));
  }, [rooms, reservations, filters]);

  return (
    <div>
      <div css={headerStyle}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 가능 회의실
        </Text>
        <Text typography="t7" fontWeight="medium" color={colors.grey500}>
          {availableRooms.length}개
        </Text>
      </div>
      <Spacing size={16} />
      <div css={listStyle}>
        {availableRooms.map(room => (
          <RoomOption
            key={room.id}
            room={room}
            isSelected={selectedRoomId === room.id}
            onSelect={room => {
              setSelectedRoomId(room.id);
              onSelect(room);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const headerStyle = css`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
