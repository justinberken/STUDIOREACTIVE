"""
MULTI LINE ORIENT
Orients a group of objects from a single reference line onto multiple target lines.
Works like 2-point orient but for multiple targets at once.

Usage:
1. Select the objects to orient
2. Select the reference/source line
3. Select the target lines
4. Objects will be copied and oriented to each target line
"""

import rhinoscriptsyntax as rs
import Rhino.Geometry as rg
import scriptcontext as sc

def get_line_endpoints(curve_id):
    """Get the start and end points of a curve/line."""
    start = rs.CurveStartPoint(curve_id)
    end = rs.CurveEndPoint(curve_id)
    return start, end

def orient_objects_to_line(object_ids, source_start, source_end, target_start, target_end, copy=True):
    """
    Orient objects from source line to target line using 2-point orientation.
    Returns the IDs of the oriented objects (copies if copy=True).
    """
    # Create the transformation
    # We need to:
    # 1. Move from source_start to target_start
    # 2. Rotate to align source direction with target direction
    # 3. Scale if the lines are different lengths
    
    source_vec = rs.VectorCreate(source_end, source_start)
    target_vec = rs.VectorCreate(target_end, target_start)
    
    source_length = rs.VectorLength(source_vec)
    target_length = rs.VectorLength(target_vec)
    
    if source_length == 0 or target_length == 0:
        print("Error: Zero length line detected")
        return None
    
    # Normalize vectors
    source_unit = rs.VectorUnitize(source_vec)
    target_unit = rs.VectorUnitize(target_vec)
    
    # Calculate scale factor
    scale_factor = target_length / source_length
    
    # Build transformation matrix
    # Step 1: Move source_start to origin
    xform_to_origin = rg.Transform.Translation(-source_start[0], -source_start[1], -source_start[2])
    
    # Step 2: Scale uniformly
    xform_scale = rg.Transform.Scale(rg.Point3d.Origin, scale_factor)
    
    # Step 3: Rotate from source direction to target direction
    source_vec_rg = rg.Vector3d(source_unit[0], source_unit[1], source_unit[2])
    target_vec_rg = rg.Vector3d(target_unit[0], target_unit[1], target_unit[2])
    xform_rotate = rg.Transform.Rotation(source_vec_rg, target_vec_rg, rg.Point3d.Origin)
    
    # Step 4: Move origin to target_start
    xform_to_target = rg.Transform.Translation(target_start[0], target_start[1], target_start[2])
    
    # Combine transformations (order matters: apply right to left)
    xform_combined = xform_to_target * xform_rotate * xform_scale * xform_to_origin
    
    # Apply transformation
    if copy:
        new_ids = rs.CopyObjects(object_ids)
        rs.TransformObjects(new_ids, xform_combined)
        return new_ids
    else:
        rs.TransformObjects(object_ids, xform_combined)
        return object_ids

def main():
    # Step 1: Select objects to orient
    object_ids = rs.GetObjects("Select objects to orient", preselect=True)
    if not object_ids:
        print("No objects selected. Exiting.")
        return
    
    print("Selected {} object(s)".format(len(object_ids)))
    
    # Step 2: Select the reference/source line
    source_line = rs.GetObject("Select the REFERENCE line (source)", rs.filter.curve)
    if not source_line:
        print("No reference line selected. Exiting.")
        return
    
    source_start, source_end = get_line_endpoints(source_line)
    print("Reference line: {} to {}".format(source_start, source_end))
    
    # Step 3: Select target lines
    target_lines = rs.GetObjects("Select TARGET lines", rs.filter.curve)
    if not target_lines:
        print("No target lines selected. Exiting.")
        return
    
    print("Selected {} target line(s)".format(len(target_lines)))
    
    # Step 4: Ask user if they want to copy or move
    copy_option = rs.GetString("Copy objects to targets?", "Yes", ["Yes", "No"])
    make_copies = (copy_option != "No")
    
    # Step 5: Orient objects to each target line
    rs.EnableRedraw(False)
    
    all_new_objects = []
    success_count = 0
    
    for i, target_line in enumerate(target_lines):
        target_start, target_end = get_line_endpoints(target_line)
        
        # Always copy for all targets except possibly the last one if not copying
        should_copy = make_copies or (i < len(target_lines) - 1)
        
        result = orient_objects_to_line(
            object_ids,
            source_start, source_end,
            target_start, target_end,
            copy=should_copy
        )
        
        if result:
            if should_copy:
                all_new_objects.extend(result)
            success_count += 1
            print("Oriented to target line {} of {}".format(i + 1, len(target_lines)))
    
    rs.EnableRedraw(True)
    
    print("\n=== COMPLETE ===")
    print("Successfully oriented objects to {} target line(s)".format(success_count))
    if all_new_objects:
        print("Created {} new object(s)".format(len(all_new_objects)))
        rs.SelectObjects(all_new_objects)

if __name__ == "__main__":
    main()
