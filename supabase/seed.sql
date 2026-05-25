insert into public.tables (id, type, position_x, position_y, capacity, min_bottles, display_order) values
  ('1', 'VIP', 460, 240, 6, 2, 1),
  ('2', 'VIP', 460, 165, 6, 2, 2),
  ('3', 'VIP', 390, 90, 6, 2, 3),
  ('4', 'VIP', 315, 90, 8, 2, 4),
  ('5', 'VIP', 240, 90, 8, 3, 5),
  ('6', 'VIP', 165, 90, 6, 2, 6),
  ('7', 'VIP', 90, 90, 6, 2, 7),
  ('8', 'Standard', 90, 190, 4, 1, 8),
  ('9', 'Standard', 90, 260, 4, 1, 9),
  ('10', 'Standard', 90, 340, 4, 1, 10),
  ('11', 'Standard', 90, 410, 5, 1, 11),
  ('12', 'Standard', 90, 480, 4, 1, 12),
  ('13', 'Standard', 90, 550, 4, 1, 13),
  ('14', 'Standard', 90, 620, 4, 1, 14),
  ('15', 'Standard', 165, 620, 4, 1, 15),
  ('S1', 'Standing', 340, 620, 2, 1, 16),
  ('S2', 'Standing', 270, 620, 2, 1, 17)
on conflict (id) do update
set
  type = excluded.type,
  position_x = excluded.position_x,
  position_y = excluded.position_y,
  capacity = excluded.capacity,
  min_bottles = excluded.min_bottles,
  display_order = excluded.display_order;

insert into public.events (id, name, dj, dress_code, poster_url, event_date, start_time, end_time, entry_fee, description, notify_subscribers)
values
  ('aaa11111-1111-1111-1111-111111111111', 'PING NIGHT VOL.42', 'DJ KAYZER, GOSU', 'Smart Casual', '/seeds/poster-1.jpg', current_date + 2, '22:00', '05:00', 30000, '시드 이벤트 1', false),
  ('aaa22222-2222-2222-2222-222222222222', 'BPM OVERLOAD', 'DJ STARLIGHT', 'All Black', '/seeds/poster-2.jpg', current_date + 9, '22:00', '05:00', 30000, '시드 이벤트 2', false),
  ('aaa33333-3333-3333-3333-333333333333', 'PING ANNIVERSARY', 'DJ KAYZER, GOSU, STARLIGHT', 'Premium Dress', '/seeds/poster-3.jpg', current_date + 16, '22:00', '05:00', 50000, '시드 이벤트 3', false)
on conflict (id) do update
set
  name = excluded.name,
  dj = excluded.dj,
  dress_code = excluded.dress_code,
  poster_url = excluded.poster_url,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  entry_fee = excluded.entry_fee,
  description = excluded.description,
  notify_subscribers = excluded.notify_subscribers;
