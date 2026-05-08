package com.isle.shared.dto;

import java.time.Instant;
import java.util.List;

public record PageResponse<T>(
    boolean success,
    String timestamp,
    List<T> data,
    int page,
    int size,
    long total,
    boolean hasMore
) {
    public static <T> PageResponse<T> of(List<T> data, int page, int size, long total) {
        boolean hasMore = ((long) page * size + data.size()) < total;
        return new PageResponse<>(true, Instant.now().toString(), data, page, size, total, hasMore);
    }

    public static <T> PageResponse<T> single(T item) {
        return new PageResponse<>(true, Instant.now().toString(), List.of(item), 0, 1, 1, false);
    }
}
