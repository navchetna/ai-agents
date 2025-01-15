import os

class Node:
    def __init__(self, level, heading, dir):
        self.__level = level
        self.__heading = heading
        self.__parent = None
        self.__content = []
        self.__children = []
        self.__dir = dir

    def get_level(self):
        return self.__level
    
    def get_heading(self):
        return self.__heading
    
    def get_content(self):
        return self.__content
    
    def set_parent(self, node):
        self.__parent = node

    def append_child(self, node):
        self.__children.append(node)

    def append_content(self, line):
        self.__content.append(line)

    def get_length_children(self):
        return len(self.__children)
    
    def get_child(self, pos):
        return self.__children[pos]
    
    def output_node_info(self):
        with open(os.path.join(self.__dir, "output.txt"), "a") as f:
            f.write(self.__heading + "\n")
            for line in self.__content:
                f.write(line)
            f.write("\n")
