exports.up = async function (knex) {
  await knex.raw(`
    DROP FUNCTION IF EXISTS get_all_event_details;
  `);

  await knex.raw(`
    CREATE FUNCTION get_all_event_details()
    RETURNS TEXT
    READS SQL DATA
    DETERMINISTIC
    BEGIN
      DECLARE result JSON;

      SELECT COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'event_id', e.id,
            'event_name', e.event_name,
            'event_type', e.event_type,
            'place', e.place,
            'image_url', e.image_url,
            'qr_code', e.qr_code,
            'description', e.description,
            'created_at', e.created_at,
            'updated_at', e.updated_at,
            'schedules', (
              SELECT COALESCE(
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'schedule_id', es.id,
                    'start_time', es.start_time,
                    'end_time', es.end_time,
                    'worship_topic', es.worship_topic,
                    'created_at', es.created_at,
                    'updated_at', es.updated_at
                  )
                ),
                JSON_ARRAY()
              )
              FROM event_schedules es
              WHERE es.event_id = e.id
            )
          )
        ),
        JSON_ARRAY()
      ) INTO result
      FROM events e;

      RETURN JSON_UNQUOTE(JSON_EXTRACT(result, '$'));
    END
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP FUNCTION IF EXISTS get_all_event_details;
  `);
};
