#!/bin/bash

echo "📁 Struttura directory docs/:"
echo ""

# Funzione per visualizzare albero directory
show_tree() {
    local dir=$1
    local prefix=$2
    local level=$3
    
    if [ $level -gt 2 ]; then
        return
    fi
    
    local items=($(ls -1 "$dir" 2>/dev/null))
    local count=${#items[@]}
    
    for i in "${!items[@]}"; do
        local item="${items[$i]}"
        local path="$dir/$item"
        
        if [ $i -eq $((count - 1)) ]; then
            echo "${prefix}└── $item"
            local new_prefix="${prefix}    "
        else
            echo "${prefix}├── $item"
            local new_prefix="${prefix}│   "
        fi
        
        if [ -d "$path" ] && [ $level -lt 2 ]; then
            show_tree "$path" "$new_prefix" $((level + 1))
        fi
    done
}

# Mostra struttura docs
echo "docs/"
show_tree "docs" "" 0

echo ""
echo "✅ Struttura documentazione visualizzata!"
