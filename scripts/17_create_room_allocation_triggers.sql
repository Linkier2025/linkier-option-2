-- Create triggers to maintain room occupancy counts and allocation consistency

-- Function to update room occupancy when allocations change
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update occupancy count for the affected room(s)
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE rooms 
        SET current_occupancy = current_occupancy + 1,
            status = CASE 
                WHEN current_occupancy + 1 >= capacity THEN 'occupied'
                ELSE 'available'
            END
        WHERE id = NEW.room_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            -- Student moved out or allocation became inactive
            UPDATE rooms 
            SET current_occupancy = GREATEST(current_occupancy - 1, 0),
                status = CASE 
                    WHEN current_occupancy - 1 = 0 THEN 'available'
                    WHEN current_occupancy - 1 < capacity THEN 'available'
                    ELSE status
                END
            WHERE id = OLD.room_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            -- Student moved in or allocation became active
            UPDATE rooms 
            SET current_occupancy = current_occupancy + 1,
                status = CASE 
                    WHEN current_occupancy + 1 >= capacity THEN 'occupied'
                    ELSE 'available'
                END
            WHERE id = NEW.room_id;
        END IF;
        
        -- Handle room changes
        IF OLD.room_id != NEW.room_id AND NEW.status = 'active' THEN
            -- Update old room
            UPDATE rooms 
            SET current_occupancy = GREATEST(current_occupancy - 1, 0),
                status = CASE 
                    WHEN current_occupancy - 1 = 0 THEN 'available'
                    WHEN current_occupancy - 1 < capacity THEN 'available'
                    ELSE status
                END
            WHERE id = OLD.room_id;
            
            -- Update new room
            UPDATE rooms 
            SET current_occupancy = current_occupancy + 1,
                status = CASE 
                    WHEN current_occupancy + 1 >= capacity THEN 'occupied'
                    ELSE 'available'
                END
            WHERE id = NEW.room_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE rooms 
        SET current_occupancy = GREATEST(current_occupancy - 1, 0),
            status = CASE 
                WHEN current_occupancy - 1 = 0 THEN 'available'
                WHEN current_occupancy - 1 < capacity THEN 'available'
                ELSE status
            END
        WHERE id = OLD.room_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_room_occupancy
    AFTER INSERT OR UPDATE OR DELETE ON room_allocations
    FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- Function to automatically create roommate relationships
CREATE OR REPLACE FUNCTION create_roommate_relationships()
RETURNS TRIGGER AS $$
DECLARE
    other_student RECORD;
BEGIN
    -- Only create relationships for active allocations
    IF NEW.status = 'active' THEN
        -- Find other active students in the same room
        FOR other_student IN 
            SELECT student_id 
            FROM room_allocations 
            WHERE room_id = NEW.room_id 
            AND student_id != NEW.student_id 
            AND status = 'active'
        LOOP
            -- Create roommate relationship if it doesn't exist
            INSERT INTO roommate_relationships (
                student1_id, 
                student2_id, 
                room_id, 
                property_id,
                status
            )
            VALUES (
                LEAST(NEW.student_id, other_student.student_id),
                GREATEST(NEW.student_id, other_student.student_id),
                NEW.room_id,
                NEW.property_id,
                'active'
            )
            ON CONFLICT (student1_id, student2_id, room_id, status) DO NOTHING;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for roommate relationships
CREATE TRIGGER trigger_create_roommate_relationships
    AFTER INSERT OR UPDATE ON room_allocations
    FOR EACH ROW EXECUTE FUNCTION create_roommate_relationships();
